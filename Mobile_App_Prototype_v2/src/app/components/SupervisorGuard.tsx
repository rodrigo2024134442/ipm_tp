import { useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import SupervisorLogin from './SupervisorLogin';

interface Props { children: React.ReactNode; }

export default function SupervisorGuard({ children }: Props) {
  const { userRole } = useApp();
  const location = useLocation();

  if (userRole !== 'supervisor') {
    return <SupervisorLogin destination={location.pathname} />;
  }

  return <>{children}</>;
}
