import { useRoute } from '@react-navigation/native';
import { AddEditHouseScreen } from './AddEditHouseScreen';

export const EditHouseScreen = () => {
  const route = useRoute();
  const houseId = route.params?.houseId;
  
  return <AddEditHouseScreen houseId={houseId} isEditing={true} />;
};
