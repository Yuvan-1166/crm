import DiscussView from '../components/discuss/DiscussView';
import { AudioCallProvider } from '../components/discuss/AudioCallProvider';
import { CallOverlay } from '../components/discuss/AudioCallUI';

/**
 * DiscussPage — Team Chat (Discord-like) with WhatsApp-style audio calls.
 * Wraps DiscussView with AudioCallProvider for call state management,
 * and renders the full-screen call overlay at this level.
 */
const DiscussPage = () => {
  return (
    <AudioCallProvider>
      <div className="h-[calc(100vh-4rem)] p-4">
        <DiscussView />
      </div>
      <CallOverlay />
    </AudioCallProvider>
  );
};

export default DiscussPage;
