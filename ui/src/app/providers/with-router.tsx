import { type FC, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';

/**
 * HOC (Higher Order Component) для добавления маршрутизации
 * Оборачивает компонент в BrowserRouter и Suspense
 * @param {FC} Component - React компонент для обертывания
 * @returns {FC} Компонент с добавленной маршрутизацией
 */
export const withRouter =
  (Component: FC): FC =>
  () => (
    <AntApp>
      <BrowserRouter>
        <Suspense fallback={<></>}>
          <Component />
        </Suspense>
      </BrowserRouter>
    </AntApp>
  );
