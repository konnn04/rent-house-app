import React from "react";
import { Dimensions, Image, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useTheme } from "../../contexts/ThemeContext";

const width = Dimensions.get("window").width;

export const HouseDetailImage = ({ images }) => {
    const { colors } = useTheme();
    const progress = useSharedValue(0);
    console.log("images", images);

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                width={width}
                height={width / 2}
                data={images}
                onProgressChange={(_, absoluteProgress) =>
                    (progress.value = absoluteProgress)
                }
                renderItem={({ item }) => (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={{ uri: item.url }}
                            style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                            }}
                        />
                    </View>
                )}
            />

            <Pagination.Basic
                progress={progress}
                data={images}
                dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.textPrimary,
                }}
                containerStyle={{
                    marginTop: 10,
                    justifyContent: "center",
                }}
            />
        </View>
    );
};
