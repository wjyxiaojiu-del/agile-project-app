import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('========== ErrorBoundary caught ==========');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('==========================================');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative animate-bounceIn"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.15))',
              border: '1px solid rgba(239, 68, 68, 0.1)',
            }}>
            <AlertTriangle size={32} className="text-red-400" />
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-10"
              style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), transparent)' }} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-1">页面出了点问题</h2>
            <p className="text-sm text-slate-400 max-w-md">
              {this.state.error?.message || '发生了未知错误'}
            </p>
          </div>
          <button onClick={this.handleReset} className="btn btn-primary gap-2">
            <RefreshCw size={14} /> 重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
