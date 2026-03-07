import DiscussView from '../components/discuss/DiscussView';
import { AudioCallProvider } from '../components/discuss/AudioCallProvider';
import { CallOverlay } from '../components/discuss/AudioCallUI';

/**
 * DiscussPage — Team Chat (Discord-like) with WhatsApp-style audio calls.
 * AudioCallProvider is now at the App level so incoming call popups show globally.
 * CallOverlay is also rendered at the App level.
 */
const DiscussPage = () => {
  return (
    <AudioCallProvider>
      <div className="h-full -m-4 lg:-m-6">
        <DiscussView />
      </div>
      <CallOverlay />
    </AudioCallProvider>
  );
};

export default DiscussPage;
