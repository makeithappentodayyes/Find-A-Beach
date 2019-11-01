	/* 
	Directions 
	
	This file, formerly named "test02.js", now named "beachProcessor.js", and the 
	file "allCaliBeaches.js" need to be used together, so the html file has to 
	reference both files as separate individual script lines.  
	
	Currently the geolocation function is behaving slow, so when it tries to get 
	a response, the searching functions somehow still fire off, with no relevant 
	source lat and long, giving a "false" failure.  So a static lat and long are 
	provided and they are the coords for UCSD Extension.  
	
	To actually access the beaches objects and their data members, you reference 
	the "arrNearbyBeaches" with array indexing and dot operation per data field.  
	
	For example, the value of the third beach's name is:  
	
	arrNearbyBeaches[2].bNameMobileWeb
	
	Let me know if this is helpful.  
	
	Thanks, 
	Alvin 
	
	*/ 

// Alvin Revilas' Google API key:	AIzaSyB1dWx5WfOrU-fvzGEqTL0wY18nVzIgfsU 
	
// some starting variables for processing locations of beaches 
// the array "arrAllCaliBeaches" is defined in the JS file "allCaliBeaches.js" 

// Sample single record from array listed below.  All data fields also shown.   

/* 
	{
		"ID": 406,
		"DISTRICT": "2_North Central",
		"CountyNum": 5,
		"COUNTY": "Marin",
		"NameMobileWeb": "Bolinas Lagoon Nature Preserve",
		"LocationMobileWeb": "Along Hwy. One and Olema-Bolinas Road",
		"DescriptionMobileWeb": "Trailhead off Olema-Bolinas Rd. E. of Horseshoe Hill Rd.",
		"PHONE_NMBR": "415-473-6387",
		"FEE": "No",
		"PARKING": "Yes",
		"DSABLDACSS": "No",
		"RESTROOMS": "No",
		"VISTOR_CTR": "No",
		"DOG_FRIENDLY": "",
		"EZ4STROLLERS": "",
		"PCNC_AREA": "",
		"CAMPGROUND": "No",
		"SNDY_BEACH": "No",
		"DUNES": "No",
		"RKY_SHORE": "No",
		"BLUFF": "No",
		"STRS_BEACH": "No",
		"PTH_BEACH": "No",
		"BLFTP_TRLS": "",
		"BLFTP_PRK": "",
		"WLDLFE_VWG": "Yes",
		"TIDEPOOL": "",
		"VOLLEYBALL": "",
		"FISHING": "No",
		"BOATING": "No",
		"LIST_ORDER": "139.01",
		"GEOGR_AREA": "H. Stinson Beach",
		"LATITUDE": 37.921996,
		"LONGITUDE": -122.68983,
		"Photo_1": "https://www.coastal.ca.gov/access-photos/06_marin/09_stinson_beach/Bolinas_Lagoon_2013_10_26_8603.jpg",
		"Photo_2": "https://www.coastal.ca.gov/access-photos/06_marin/09_stinson_beach/Bolinas_Lagoon_2013_10_26_8590.jpg",
		"Photo_3": "https://www.coastal.ca.gov/access-photos/06_marin/09_stinson_beach/Bolinas_Lagoon_2013_10_26_8572.jpg",
		"Photo_4": "",
		"Bch_whlchr": "",
		"BIKE_PATH": "No",
		"BT_FACIL_TYPE": ""
	}
*/ 
	
// default searching magnitude with a scaling value to make a rectangle that would be closer in area to a search radius.	
	var inputDist  = 10.0;             // relative distance in miles.  Default value.  
	var searchDist = 0.85 * inputDist; // estimating too large simple square into better smaller square search area 

	var longitudePerMile = 0.0164;     // estimated conversion constant for California. Conversion constant should be smaller closer to equator, larger closer to North Pole 
	var latitudePerMile  = 0.0145;     // estimated conversion constant, rounded up.  This does NOT change due to this dimension being center point based, not axis based like longitude 

	function beachCoords(lat, lng) {
		this.lat = lat,
		this.lng = lng;
	}

	var boolUseGeolocation = false; // setup flag to mark if we can or cannot use geolocation 
	var myStartLtLg;                // empty holder for starting LATITUDE and LONGITUDE 

	var geoLocLat; // holder for latitude from geolocation 
	var geoLocLng; // holder for longitude from geolocation 

	// backup variables in case geolocation doesn't give coords 
	// myStartLtLg = new beachCoords( 32.8530875, -117.18322279999998 ); // coords for UCSD Extension room 308 
	// myStartLtLg = new beachCoords( 32.8916087, -117.1520858 );        // coords for my job "Search Gear" 

	function checkForGeolocation () { 
	
/* 
		// how come the navigator.geolocation is not reacting quick enough??  
		
		if (navigator.geolocation) { 
		
			boolUseGeolocation = true; 
			navigator.geolocation.getCurrentPosition( displayLocationInfo, failedGetPos ); 
			// myStartLtLg = new beachCoords( geoLocLat, geoLocLng ); 
			
			getNearbyBeaches (); 
			
		} else { 
		
			boolUseGeolocation = false; 
			console.log( "Geolocation failed.  Using default lat & long." ); 
			myStartLtLg = new beachCoords( 32.8530875, -117.18322279999998 ); 
			
		} 
*/ 

		// myStartLtLg = new beachCoords( geoLocLat, geoLocLng ); // coords for UCSD Extension room 308 
	
		myStartLtLg = new beachCoords( 32.8530875, -117.18322279999998 ); // coords for UCSD Extension room 308 

		
		
	} 

	function displayLocationInfo(position) {
		geoLocLat = position.coords.latitude; 
		geoLocLng = position.coords.longitude; 
		
		console.log( "Success!!  Latitude: " + geoLocLat + ", Longitude: " + geoLocLng ); 
		
		myStartLtLg = new beachCoords( geoLocLat, geoLocLng ); 
	} 

	function failedGetPos () { 
	
		// default coords for UCSD Extension room 308 
		geoLocLat = 32.8530875; 
		geoLocLng = -117.18322279999998; 
		
		myStartLtLg = new beachCoords( geoLocLat, geoLocLng ); 
		console.log("Failed to get current position.  Using default latitude and longitude of UCSD Extension room 308."); 
	} 

	// beach object to populate our nearby beaches array 
	// this might be expanded on later by adding more search parameters that fit the native object such as "dog friendly?" 
	function myCaliBeachObj ( 
		bID, 
		bNameMobileWeb, 
		bLATITUDE, 
		bLONGITUDE, 
		bPhoto_1 ) { 
	
		this.bID            = bID; 
		this.bNameMobileWeb = bNameMobileWeb; 
		this.bLATITUDE      = bLATITUDE; 
		this.bLONGITUDE     = bLONGITUDE; 
		this.bPhoto_1       = bPhoto_1; 
	
	} 
	
/*
This function, named "isBeachInsideSearchBorders", attempts to find a set of latitude and longitude coordinates inside a rectangular search area.  
The rectangular search area borders are determined by the following:  

North border:  northmost Latitude value 
South border:  southmost Latitude value 
East border:   eastmost  Longitude value 
West border:   westmost  Longitude value 

This function returns a boolean true or false.  
*/ 

	/* returns a boolean value */ 
	function isBeachInsideSearchBorders ( 
		northLatBrdr, 
		southLatBrdr, 
		eastLngBrdr, 
		westLngBrdr, 
		bchLat, 
		bchLong ) { 
	
		if ( bchLat <= northLatBrdr ) {             // check if below North border; possible true if this passes 
			if ( bchLat >= southLatBrdr ) {         // check if above South border; possible true if this passes 
				if ( bchLong >= westLngBrdr ) {     // check if east of the west border; possible true if this passes;     going west of Greenwich Mean goes negative 
					if ( bchLong <= eastLngBrdr ) { // check if west of the east border; definite true if this passes!!  ; going west of Greenwich Mean goes negative 
					
						console.log("BINGO"); 
						return true;                // the ONLY result that should return true because all border tests have passed!!  
	
					} else { 
						console.log("Beach is too far east."); 
						return false; 
					}
				} else { 
					console.log("Beach is too far west."); 
					return false; 
				}
			} else { 
				console.log("Beach is too far south."); 
				return false; 
			} 
		} else { 
			console.log("Beach is too far north."); 
			return false; 
		} 
	
	} 
	
	var tmpBeach;                     // temporary holding variable for beaches 
	var arrNearbyBeaches = new Array; // array to hold possible valid search results 
	var boolFoundBeach   = false;     // boolean flag to signal if a beach was found with given parameters 
	var maxBeaches       = 5;         // arbitrary maximum amount of beaches to return 
	var lengthArrNearbyBeaches;       // holder for knowing how long the found beaches array really is 

	// search loop to potentially populate a search results array 
	function getNearbyBeaches () { 
	
		for (i in arrAllCaliBeaches) { 
			if ( // first check if each beach is inside search borders 
				isBeachInsideSearchBorders(
					userNorthLatBorder, 
					userSouthLatBorder, 
					userEastLongBorder, 
					userWestLongBorder, 
					arrAllCaliBeaches[i].LATITUDE, 
					arrAllCaliBeaches[i].LONGITUDE
				)
			) { 
				if ( arrAllCaliBeaches[i].Photo_1 != "" ) { // now check to see if this location hit has a photo 
					if ( arrAllCaliBeaches[i].SNDY_BEACH == "Yes" ) { // now check to see if this location hit has an actual sandy beach 
					
						tmpBeach = new myCaliBeachObj ( 
							arrAllCaliBeaches[i].ID, 
							arrAllCaliBeaches[i].NameMobileWeb, 
							arrAllCaliBeaches[i].LATITUDE, 
							arrAllCaliBeaches[i].LONGITUDE, 
							arrAllCaliBeaches[i].Photo_1
						); 
	
						// positive hit result with a picture now gets added to array of nearby beaches 
						arrNearbyBeaches.push(tmpBeach); 
						boolFoundBeach = true; 
						console.log( "Found nearby beach! : " + arrAllCaliBeaches[i].NameMobileWeb ); 
						
					} 
				} 
	
			} 
	
		} 
	} 
	
	checkForGeolocation (); 
	
	var userNorthLatBorder = myStartLtLg.lat + (searchDist * latitudePerMile); // north border of search area 
	var userSouthLatBorder = myStartLtLg.lat - (searchDist * latitudePerMile); // south border of search area 
	
	var userEastLongBorder = myStartLtLg.lng + (searchDist * longitudePerMile); // east border of search area 
	var userWestLongBorder = myStartLtLg.lng - (searchDist * longitudePerMile); // west border of search area 

	getNearbyBeaches (); 

	// diagnostic messages to verify contents of nearby beaches array and check on accessibility of array 
	
	console.log(arrNearbyBeaches); 
	lengthArrNearbyBeaches = arrNearbyBeaches.length; 
	console.log("the length of the nearby beaches array is: " + lengthArrNearbyBeaches); 

	var beachLoopLength = ( maxBeaches >= lengthArrNearbyBeaches ) ? ( lengthArrNearbyBeaches ) : ( maxBeaches ) ; 

	console.log("beach loop length is " + beachLoopLength)
	
	for ( i = 0; i < beachLoopLength; i ++ ) { 
	
		console.log( "Beach #" + i + ", name: "      + arrNearbyBeaches[i].bNameMobileWeb ); 
		console.log( "Beach #" + i + ", image src: " + arrNearbyBeaches[i].bPhoto_1 ); 
		console.log( "Beach #" + i + ", Latitude: "  + arrNearbyBeaches[i].bLATITUDE ); 
		console.log( "Beach #" + i + ", Longitude: " + arrNearbyBeaches[i].bLONGITUDE ); 
		
	} 
	

	
