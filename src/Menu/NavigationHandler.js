import { useNavigate } from 'react-router-dom';

const NavigationHandler = ({ onNavigate }) => {
  const navigate = useNavigate();

  onNavigate(navigate);

  return null;
};

export default NavigationHandler;
