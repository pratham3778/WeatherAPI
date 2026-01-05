package com.WeatherAPI.service;

import com.WeatherAPI.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    @Value("${weather.api.forecast.url}")
    private String apiForecast;

    private RestTemplate template = new RestTemplate();

    public String test() {
        return "good";
    }

    public WeatherResponse getData(String city) {
        String url = apiUrl + "?key=" + apiKey + "&q=" + city;
        Root response = template.getForObject(url, Root.class);
        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setCity(response.getLocation().name);
        weatherResponse.setRegion(response.getLocation().region);
        weatherResponse.setCountry(response.getLocation().country);

        String condition = response.getCurrent().getCondition().getText();
        weatherResponse.setSituation(condition);

        weatherResponse.setTemperature(response.getCurrent().getTemp_c());



        return weatherResponse;
    }

    public WeatherForecast getForecast(String city, int days) {
        WeatherForecast weatherForecast = new WeatherForecast();
        WeatherResponse weatherResponse = getData(city);
        WeatherForecast response = new WeatherForecast();

        response.setWeatherResponse(weatherResponse);

        List<DayTemp> dayList = new ArrayList<>();
        String url = apiForecast + "?key=" + apiKey + "&q=" + city + "&days=" + days;
        Root apiResponse = template.getForObject(url, Root.class);
        Forecast forecast = apiResponse.getForecast();
        ArrayList<Forecastday> forecastdays = forecast.getForecastday();
        for (Forecastday rs : forecastdays) {
            DayTemp d = new DayTemp();
            d.setDate(rs.getDate());
            d.setMinTemp(rs.getDay().mintemp_c);
            d.setAvgTemp(rs.getDay().avgtemp_c);
            d.setMaxTemp(rs.getDay().maxtemp_c);
            dayList.add(d);
        }
        response.setDayTemp(dayList);
        return response;
    }



}