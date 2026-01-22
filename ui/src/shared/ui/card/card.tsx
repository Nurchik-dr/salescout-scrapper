import React from 'react';
import { Card, Button, Row, Col, Tag } from 'antd';
import { formatDateAndTime } from '../../utils/formatDate';
import { formatNumber } from '../../utils/formatInteger';

interface VideoCardProps {
  previewUrl: string;
  author: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  growthPercent: number;
  viralScore: number;
  isViral: boolean;
  isAd: boolean;
  onWatch: () => void;
  onRepeat: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  previewUrl,
  author,
  publishedAt,
  views,
  likes,
  comments,
  growthPercent,
  viralScore,
  isViral,
  isAd,
  onWatch,
  onRepeat,
}) => {
  return (
    <Card
      style={{
        width: '100%',
        height: '100%',
        padding: '5px',
      }}
      styles={{
        body: { padding: 0 },
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            src={previewUrl}
            alt="video preview"
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
          {isViral && (
            <Tag
              color="red"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 12,
                fontWeight: 'bold',
                padding: '4px 12px',
                margin: 0,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              🔥 Горячее видео
            </Tag>
          )}
          {/*{isAd && (*/}
          {/*  <Tag*/}
          {/*    color="orange"*/}
          {/*    style={{*/}
          {/*      position: 'absolute',*/}
          {/*      top: isViral ? 44 : 8,*/}
          {/*      right: 8,*/}
          {/*      fontSize: 11,*/}
          {/*      fontWeight: 'bold',*/}
          {/*      padding: '2px 8px',*/}
          {/*      margin: 0,*/}
          {/*      border: 'none',*/}
          {/*      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    📢 Реклама*/}
          {/*  </Tag>*/}
          {/*)}*/}
        </div>
      }
    >
      <div style={{ marginBottom: 8 }}>
        <strong>@{author}</strong>
        <div style={{ fontSize: 12, color: '#888' }}>{formatDateAndTime(publishedAt)}</div>
      </div>

      {/* Метрики */}
      <Col style={{ marginBottom: 8, paddingInline: 0 }}>
        <p style={{ fontSize: 15, margin: 0 }}>
          👁️ Просмотры: <strong>{formatNumber(views)}</strong>
        </p>
        <p style={{ fontSize: 15, margin: 0 }}>
          ❤️ Лайки: <strong>{formatNumber(likes)}</strong>
        </p>
        <p style={{ fontSize: 15, margin: 0 }}>
          💬 Комментарии: <strong>{formatNumber(comments)}</strong>
        </p>
      </Col>

      {/* Рост и Viral Score */}
      <div style={{ marginBottom: 8 }}>
        {/*<div style={{ fontSize: 15 }}>📈 Рост просмотров за 12ч: +{growthPercent}%</div>*/}
        <div style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          🔥 Очки: <strong>{formatNumber(viralScore)}</strong>
          {isViral && (
            <Tag color="red" style={{ margin: 0 }}>
              ВИРУСНОЕ
            </Tag>
          )}
        </div>
      </div>

      {/* Кнопки */}
      <Row gutter={8}>
        <Col span={12}>
          <Button block onClick={onWatch}>
            Смотреть
          </Button>
        </Col>
        <Col span={12}>
          <Button type="primary" block onClick={onRepeat}>
            Как повторить?
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
