import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IONIC_DIRECTIVES, Searchbar } from 'ionic-angular';

/**
	* @author Amal ROCHD
	* @description Component for google places autocomplete
	* @module Authentication
*/
@Component({
	selector: 'google-places',
	templateUrl: 'build/components/google-places/google-places.html',
	directives: [IONIC_DIRECTIVES]
})
export class GooglePlaces {
	private options = {
		//restricting the search for french addresses
		componentRestrictions: {country: 'fr'},
	};
	
	constructor() {
	}
	//output property that fires events to which we can subscribe with an event binding
	@Output() onPlaceChanged: EventEmitter<any> = new EventEmitter();
	//Binds the first result of the component view query 'searchbar' to the 'searchBar' property of the class
	@ViewChild('searchbar') searchBar: Searchbar;
	/**
		* @description Component views are initialized here
	*/
	ngAfterViewInit() {
		var input = this.searchBar.inputElement;
		var acutocomplete = new google.maps.places.Autocomplete(input, this.options);
		acutocomplete.addListener('place_changed', () => {
			this.onPlaceChanged.emit(acutocomplete.getPlace());
		});
	}
	//input property of the search bar that we can update via property binding
	@Input() bindModelData: any;
	//output property that fires events to which we can subscribe with an event binding
	@Output() bindModelDataChange: EventEmitter = new EventEmitter();
    /**
		* @description method that bind the ngModel of the searchbar to the component
	*/
	updateData(event) {
      this.bindModelData = event;
      this.bindModelDataChange.emit(event);
    }
}