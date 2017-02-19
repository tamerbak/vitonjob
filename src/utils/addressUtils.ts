import {Injectable} from "@angular/core";
import {Utils} from "../utils/utils";

@Injectable()
export class AddressUtils {

  constructor() {
  }

  public static decorticateGeolocAddress(geolocAddress) {
    let adrObj:any = {name, streetNumber: '', street: '', zipCode: '', city: '', country: ''};
    for (var i = 0; i < geolocAddress.address_components.length; i++) {
      if (geolocAddress.address_components[i].types[0] == "street_number") {
        adrObj.streetNumber = geolocAddress.address_components[i].long_name;
        continue;
      }
      if (geolocAddress.address_components[i].types[0] == "route") {
        adrObj.street = geolocAddress.address_components[i].long_name;
        continue;
      }
      if (geolocAddress.address_components[i].types[0] == "postal_code") {
        adrObj.zipCode = geolocAddress.address_components[i].long_name;
        continue;
      }
      if (geolocAddress.address_components[i].types[0] == "locality") {
        adrObj.city = geolocAddress.address_components[i].long_name;
        continue;
      }
      if (geolocAddress.address_components[i].types[0] == "country") {
        adrObj.country = geolocAddress.address_components[i].long_name;
        continue;
      }
    }

    if (!Utils.isEmpty(geolocAddress.name) && !Utils.isEmpty(adrObj.street) && geolocAddress.name.indexOf(adrObj.street) != -1) {
      adrObj.name = "";
    } else {
      adrObj.name = geolocAddress.name;
    }
    console.log()
    return adrObj;
  }

  public static constructFullAddress(name: string, streetNumber: string, street: string, zipCode: string, city: string, country: string) {
    let fa = '';
    if (name && name.length > 0) {
      fa = name;
    }

    if (streetNumber && streetNumber.length > 0) {
      fa = fa + ' ' + streetNumber;
    }

    if (street && street.length > 0) {
      fa = fa + ' ' + street;
    }

    if (zipCode && zipCode.length > 0) {
      fa = fa + ' ' + zipCode;
    }

    if (city && city.length > 0) {
      fa = fa + ' ' + city;
    }

    if (country && country.length > 0) {
      fa = fa + ' ' + country;
    }

    return fa.trim();
  }
}
