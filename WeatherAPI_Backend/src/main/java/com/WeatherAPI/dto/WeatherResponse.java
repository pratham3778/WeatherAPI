package com.WeatherAPI.dto;

public class WeatherResponse {
    private String city;
    private String region;
    private String country;
    private String situation;
    private Double temperature;

    public WeatherResponse() {
    }

    public WeatherResponse(String city, String region, String country, String situation, Double temperature) {
        this.city = city;
        this.region = region;
        this.country = country;
        this.situation = situation;
        this.temperature = temperature;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getSituation() {
        return situation;
    }

    public void setSituation(String situation) {
        this.situation = situation;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
}
