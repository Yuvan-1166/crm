import DiscussView from '../components/discuss/DiscussView';

/**
 * DiscussPage — Team Chat (Discord-like) with WhatsApp-style audio calls.
 * AudioCallProvider is now at the App level so incoming call popups show globally.
 * CallOverlay is also rendered at the App level.
 */
const DiscussPage = () => {
  return (
    <div className="h-[calc(100vh-4rem)] -m-4 md:-m-6">
      <DiscussView />
    </div>
  );
};

export default DiscussPage;
