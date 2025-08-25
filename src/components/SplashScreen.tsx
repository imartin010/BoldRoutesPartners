import { useSplash } from '../contexts/SplashContext';
import LoadingSplash from './splash/LoadingSplash';
import WelcomeSplash from './splash/WelcomeSplash';
import LanguageSplash from './splash/LanguageSplash';

export default function SplashScreen() {
  const { currentStep } = useSplash();

  switch (currentStep) {
    case 'loading':
      return <LoadingSplash />;
    case 'welcome':
      return <WelcomeSplash />;
    case 'language':
      return <LanguageSplash />;
    case 'complete':
      return null;
    default:
      return null;
  }
}
