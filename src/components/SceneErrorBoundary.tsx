import { Component, type ReactNode } from 'react';

interface SceneErrorBoundaryProps {
  children: ReactNode;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-emeraldLuxury/90 text-center text-sm text-goldLuxury">
          场景加载失败，请刷新页面或检查浏览器兼容性。
        </div>
      );
    }

    return this.props.children;
  }
}

export default SceneErrorBoundary;
