// Scene router — delegates to the appropriate view component
import SurfaceView  from './SurfaceView';
import CornerView   from './CornerView';
import AerialView   from './AerialView';
import FramingView  from './FramingView';
import DetailView   from './DetailView';

export default function Scene({ houseStyle, shape, deckColor, railingStyle, view }) {
  const props = { houseStyle, shape, deckColor, railingStyle };

  switch (view) {
    case 'corner':  return <CornerView  {...props}/>;
    case 'aerial':  return <AerialView  shape={shape} deckColor={deckColor} railingStyle={railingStyle}/>;
    case 'framing': return <FramingView shape={shape} deckColor={deckColor}/>;
    case 'detail':  return <DetailView  deckColor={deckColor} railingStyle={railingStyle}/>;
    default:        return <SurfaceView {...props}/>;
  }
}
