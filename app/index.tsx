import { Button, ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { IconArrowRight } from "@tabler/icons-react-native";
import ToggleView from "./components/ToggleView";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import moment from "moment-timezone";
import tzlookup from "tz-lookup";
import { WeatherData } from "./types";
import { LineChart } from "react-native-svg-charts";

export default function Index() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isStartSpinnerVisible, setIsStartSpinnerVisible] =
    useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date>(
    new Date(Date.now() + 3600 * 1000 * 24 * 7)
  );
  const [isEndSpinnerVisible, setIsEndSpinnerVisible] =
    useState<boolean>(false);
  const [temperature, setTemperature] = useState<boolean>(true);
  const [humidity, setHumidity] = useState<boolean>(false);
  const [dewPoint, setDewPoint] = useState<boolean>(false);
  const [data, setData] = useState<WeatherData | undefined>(undefined);

  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const getTimeZone = (latitude: number, longitude: number): string => {
    return tzlookup(latitude, longitude);
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    const parameters: string[] = [];
    if (temperature) parameters.push("temperature_2m");
    if (humidity) parameters.push("relative_humidity_2m");
    if (dewPoint) parameters.push("dew_point_2m");

    const timezone = getTimeZone(latitude, longitude);

    // Use UTC dates for the request
    const startDateString = moment(startDate).utc().format("YYYY-MM-DD");
    const endDateString = moment(endDate).utc().format("YYYY-MM-DD");

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${parameters.join(
          ","
        )}&start_date=${startDateString}&end_date=${endDateString}&timezone=${encodeURIComponent(
          timezone
        )}`
      );
      const data: WeatherData = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData(region.latitude, region.longitude);
  }, [region, startDate, endDate, temperature, humidity, dewPoint]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.warn("Permission to access location was denied");
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      console.log(`Current coordinates: ${latitude}, ${longitude}`);

      setRegion((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    fetchWeatherData(newRegion.latitude, newRegion.longitude);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const chartData = {
    temperature: data?.hourly.temperature_2m || [],
    humidity: data?.hourly.relative_humidity_2m || [],
    dewPoint: data?.hourly.dew_point_2m || [],
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              title={Intl.DateTimeFormat().format(startDate)}
              onPress={() => {
                setIsEndSpinnerVisible(false);
                setIsStartSpinnerVisible((value) => !value);
              }}
            />
          </View>
          <IconArrowRight />
          <View style={styles.button}>
            <Button
              title={Intl.DateTimeFormat().format(endDate)}
              onPress={() => {
                setIsStartSpinnerVisible(false);
                setIsEndSpinnerVisible((value) => !value);
              }}
            />
          </View>
        </View>
        {isStartSpinnerVisible && (
          <RNDateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
            maximumDate={endDate}
          />
        )}
        {isEndSpinnerVisible && (
          <RNDateTimePicker
            value={endDate}
            mode="date"
            display="spinner"
            minimumDate={startDate}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
        <View style={styles.checkContainer}>
          <ToggleView
            value={temperature}
            setValue={setTemperature}
            text="Teplota"
          />
          <ToggleView value={humidity} setValue={setHumidity} text="Vlhkost" />
          <ToggleView
            value={dewPoint}
            setValue={setDewPoint}
            text="Rosný bod"
          />
        </View>

        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents="none"
          >
            <View
              pointerEvents="none"
              style={{
                width: 10,
                height: 10,
                backgroundColor: "red",
                borderRadius: 5,
              }}
            />
          </View>
        </MapView>
        <Button title="Current Location" onPress={getCurrentLocation} />
        <LineChart
          style={{ height: 200, width: "100%" }}
          data={[
            { data: chartData.temperature, svg: { stroke: "red" } },
            { data: chartData.humidity, svg: { stroke: "blue" } },
            { data: chartData.dewPoint, svg: { stroke: "green" } },
          ]}
          contentInset={{ top: 20, bottom: 20 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  checkContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
    marginTop: 20,
  },
  button: {},
  map: {
    width: "100%",
    height: 300,
    marginTop: 20,
  },
});
