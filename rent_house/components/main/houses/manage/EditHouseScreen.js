import { useRoute } from '@react-navigation/native';
import { AddEditHouseScreen } from './AddEditHouseScreen';

export const EditHouseScreen = () => {
  const route = useRoute();
  // Pass the houseId from route params to the AddEditHouseScreen
  return <AddEditHouseScreen />;
};
