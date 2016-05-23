import {Component, Output, EventEmitter, ViewChild} from 'angular2/core';
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
	
	@Output() onPlaceChanged: EventEmitter<any> = new EventEmitter();
	
	@ViewChild('searchbar') searchBar: Searchbar;
	
	/**
		* @description construction of the component after initializing the view
	*/
	ngAfterViewInit() {
		var input = this.searchBar.inputElement;
		var acutocomplete = new google.maps.places.Autocomplete(input, this.options);
		acutocomplete.addListener('place_changed', () => {
			this.onPlaceChanged.emit(acutocomplete.getPlace());
		});
	}
}
