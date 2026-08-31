import { Country, State, City } from "country-state-city";

export const getCountries = async () => {
  return Country.getAllCountries().map(c => ({
    id: c.isoCode,
    country_name: c.name
  }));
};

export const getStates = async (countryCode) => {
  return State.getStatesOfCountry(countryCode).map(s => ({
    id: s.isoCode,
    state_name: s.name
  }));
};

export const getCities = async (countryCode, stateCode) => {
  return City.getCitiesOfState(countryCode, stateCode).map(c => ({
    id: c.name,
    city_name: c.name
  }));
};
