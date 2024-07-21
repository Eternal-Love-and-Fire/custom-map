import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { PoiMarkers } from "../libs/components/components";
import { Api_KEY_MAP_ID, API_KEY_MAPS } from "../env-example";
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../libs/db/firebase";
import { useEffect, useState } from "react";
import { PoiType } from "../libs/types/poi-type";

const App = () => {
  const [markers, setMarkers] = useState<PoiType[]>([]);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchMarkers = async () => {
      const querySnapshot = await getDocs(collection(db, "markers"));

      const markersData = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        location: doc.data().location,
        timestamp: doc.data().timestamp,
      }));

      setMarkers(markersData);
    };
    fetchMarkers();
  }, []);

  const handleMapOnClick = async (event: MapMouseEvent) => {
    if (event.detail.latLng && !deleteMode) {
      const newMarker = {
        key: `marker-${Date.now()}`,
        location: {
          lat: event.detail.latLng.lat,
          lng: event.detail.latLng.lng,
        },
        timestamp: new Date(),
      };

      try {
        const docRef = await addDoc(collection(db, "markers"), {
          location: newMarker.location,
        });
        setMarkers((prevMarkers) => [
          ...prevMarkers,
          { ...newMarker, key: docRef.id },
        ]);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else if (deleteMode) {
      const { latLng } = event.detail;
      const clickedMarker = markers.find(
        (marker) =>
          marker.location.lat === latLng?.lat &&
          marker.location.lng === latLng?.lng
      );

      if (clickedMarker) {
        try {
          await deleteDoc(doc(db, "markers", clickedMarker.key));
          setMarkers((prevMarkers) =>
            prevMarkers.filter((marker) => marker.key !== clickedMarker.key)
          );
        } catch (e) {
          console.error("Error deleting document: ", e);
        }
      }
    }
  };

  const handleMarkerDelete = async (key: string) => {
    if (deleteMode) {
      const clickedMarker = markers.find((marker) => marker.key === key);

      if (clickedMarker) {
        try {
          await deleteDoc(doc(db, "markers", clickedMarker.key));
          setMarkers((prevMarkers) =>
            prevMarkers.filter((marker) => marker.key !== clickedMarker.key)
          );
        } catch (e) {
          console.error("Error deleting document: ", e);
        }
      }
    }
  };

  const handleDragEnd = async (
    id: string,
    newLocation: { lat: number; lng: number }
  ) => {
    try {
      const markerRef = doc(db, "markers", id);
      await updateDoc(markerRef, {
        location: newLocation,
      });

      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.key === id ? { ...marker, location: newLocation } : marker
        )
      );
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    if (deleteMode) {
      document.body.style.cursor = "crosshair";
    } else {
      document.body.style.cursor = "pointer";
    }
  };

  const handleDeleteAll = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "markers"));
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      setMarkers([]);
    } catch (e) {
      console.error("Error deleting all documents: ", e);
    }
  };

  return (
    <div className="wrap">
      <APIProvider apiKey={API_KEY_MAPS}>
        <Map
          defaultZoom={13}
          style={{ zIndex: 0 }}
          defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
          mapId={Api_KEY_MAP_ID}
          onClick={handleMapOnClick}
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
        >
          <PoiMarkers
            pois={markers}
            onDragEnd={handleDragEnd}
            handleMarkerClick={handleMarkerDelete}
          />
        </Map>
        <div className="sidebar">
          <button className="sidebar__button" onClick={handleDeleteMode}>
            Delete Mode
          </button>
          <button className="sidebar__button" onClick={handleDeleteAll}>
            Delete Markers
          </button>
        </div>
      </APIProvider>
    </div>
  );
};

export { App };
