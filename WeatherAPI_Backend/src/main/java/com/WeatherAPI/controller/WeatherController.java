package com.WeatherAPI.controller;

import com.WeatherAPI.dto.Root;
import com.WeatherAPI.dto.WeatherForecast;
import com.WeatherAPI.dto.WeatherResponse;
import com.WeatherAPI.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/weather")
@CrossOrigin
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping("/{city}")
    public String getWeatherData(@PathVariable String city) {
        return weatherService.test();
    }

    @GetMapping("/my/{city}")
    public WeatherResponse getWeather(@PathVariable String city) {
        return weatherService.getData(city);
    }

    @GetMapping("/forecast")
    public WeatherForecast getForecast(@RequestParam String city, @RequestParam int days) {
        return weatherService.getForecast(city, days);
    }


}
