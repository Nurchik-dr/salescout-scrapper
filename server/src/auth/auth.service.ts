import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhoneCode } from './schemas/phone-code.schema';
import { generateOtp } from './utils/otp.util';
import { hashPassword } from './utils/hash.util';
import { User } from '../user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PhoneCode.name) private phoneCodeModel: Model<PhoneCode>,
    private readonly whatsappService: WhatsappService,
    private jwtService: JwtService,
  ) {}

  async login(phoneNumber: string, password: string) {
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid password');
    }

    const payload = {
      sub: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async sendCode(phoneNumber: string) {
    const code = generateOtp();
    const user = await this.userModel.findOne({ phoneNumber }).exec();
    if (user) {
      throw new ConflictException('У вас уже есть аккаунт');
    }

    await this.whatsappService.sendMessage(phoneNumber, `SaleScout.me\nКод проверки: *${code}*\n\nДанный чат служит только для рассылки технических сообщений.\n*Сообщения отправленные на этот номер останутся без ответа.*\n\nДля получения обратной связи напишите по номеру\n+77008368168\n`)

    await this.phoneCodeModel.deleteMany({ phoneNumber });

    await this.phoneCodeModel.create({
      phoneNumber,
      code,
      verified: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });


    console.log(`📲 WhatsApp code for ${phoneNumber}: ${code}`);

    return { success: true };
  }

  async verifyCode(phoneNumber: string, code: string) {
    const record = await this.phoneCodeModel.findOne({ phoneNumber, code });

    if (!record) {
      throw new BadRequestException('Неверный код подтверждения');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Код истек. Запросите новый код.');
    }

    if (record.verified) {
      throw new BadRequestException('Код уже был использован');
    }

    record.verified = true;
    await record.save();

    const tempTokenPayload = {
      phoneNumber,
      type: 'password-set',
    };

    const tempToken = this.jwtService.sign(tempTokenPayload, {
      expiresIn: '15m',
    });

    return {
      success: true,
      tempToken,
    };
  }

  async setPassword(tempToken: string, password: string) {
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(tempToken);
    } catch (error) {
      throw new BadRequestException('Недействительный или истекший токен');
    }

    // Проверяем, что токен правильного типа
    if (decodedToken.type !== 'password-set') {
      throw new BadRequestException('Неверный тип токена');
    }

    const phoneNumber = decodedToken.phoneNumber;

    // Проверяем, что пользователь еще не существует
    const existingUser = await this.userModel.findOne({ phoneNumber });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким номером уже существует');
    }

    // Проверяем, что код был верифицирован
    const record = await this.phoneCodeModel.findOne({
      phoneNumber,
      verified: true,
    });

    if (!record) {
      throw new BadRequestException('Телефон не подтвержден. Сначала верифицируйте код.');
    }

    const passwordHash = await hashPassword(password);

    let user;
    try {
      user = await this.userModel.create({
        phoneNumber,
        passwordHash,
        role: 'user',
      });
    } catch (error: any) {
      // Обработка ошибки дублирования от MongoDB
      if (error.code === 11000) {
        throw new ConflictException('Пользователь с таким номером уже существует');
      }
      throw error;
    }

    await this.phoneCodeModel.deleteMany({ phoneNumber });

    const payload = {
      sub: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return {
      success: true,
      userId: user._id,
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
