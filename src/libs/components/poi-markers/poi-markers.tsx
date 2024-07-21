import { PoiType } from "../../types/poi-type";
import { AdvancedMarker, Pin} from "@vis.gl/react-google-maps";

const PoiMarkers = ({
  pois,
  onDragEnd,
  handleMarkerClick,
}: {
  pois: PoiType[];
  handleMarkerClick: (key: string) => void;
  onDragEnd: (id: string, newLocation: { lat: number; lng: number }) => void;
}) => {
  return (
    <>
      {pois.map((poi: PoiType) => (
        <AdvancedMarker
          position={poi.location}
          key={poi.key}
          draggable
          onClick={() => handleMarkerClick(poi.key)}
          onDragEnd={(event) => {
            const newLocation = {
              lat: event.latLng?.lat(),
              lng: event.latLng?.lng(),
            };
            onDragEnd(poi.key, newLocation as { lat: number; lng: number });
          }}
        >
          <Pin
            background={"#FBBC04"}
            glyphColor={"#000"}
            borderColor={"#000"}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

export { PoiMarkers };
