import { useRoute } from '@react-navigation/native';
import { AddEditHouseScreen } from './AddEditHouseScreen';

export const EditHouseScreen = () => {
  const route = useRoute();
  const houseId = route.params?.houseId;
  
  // Pass the houseId from route params to the AddEditHouseScreen
  return <AddEditHouseScreen houseId={houseId} isEditing={true} />;
};
