document.addEventListener("DOMContentLoaded", function() {
  var STATES = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "District of Columbia",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North Carolina",
    "North Dakota",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "Nevada",
    "New York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Vermont",
    "Washington",
    "Wisconsin",
    "West Virginia",
    "Wyoming"
  ];

  var app = new Vue({
    el: '#political-scoreboard',

    data: {
      message: 'Hello Vue!',
      states: STATES,
      selectedState: null,
      politicians: [],
      isLoaded: false
    },

    computed: {
      congressInState: function() {
        var self = this;
        return this.politicians.filter(function(p){
          return p.state === self.selectedState;
        });
      },

      congressTeamInternet: function() {
        var self = this;
        return this.politicians.filter(function(p){
          return p.team === 'team-internet';
        });
      },

      congressUnknown: function() {
        var self = this;
        return this.politicians.filter(function(p){
          return p.team === 'team-unknown';
        });
      },

      congressCable: function() {
        var self = this;
        return this.politicians.filter(function(p){
          return p.team === 'team-cable';
        });
      }
    },

    created: function() {
      this.geocodeSelectedState();
      this.fetchPoliticians();
    },

    methods: {
      geocodeSelectedState: function() {
        var self = this;
        this.$http.get('https://fftf-geocoder.herokuapp.com').then(function(response){
          if (response.ok) {
            var geo = response.body;

            if (
              geo.country.iso_code === 'US' &&
              geo.subdivisions &&
              geo.subdivisions[0] &&
              geo.subdivisions[0].names &&
              geo.subdivisions[0].names.en
            ) {
              self.selectedState = geo.subdivisions[0].names.en;
            }
          }
        });
      },

      fetchPoliticians: function() {
        var self = this;
        this.$http.get('https://cache.battleforthenet.com/v2/politicians-parsed.json').then(function(response){
          if (response.ok) {
            self.politicians = response.body;
          }
        });
      }
    }
  });

  Vue.component('politician-card', {
    template: '#politician-card-template',
    props: [ 'politician' ],
    methods: {
      imageURL: function(pol, suffix='_x1') {
        return 'images/congress/' +  pol.biocode + suffix + '.jpg';
      },

      isLong: function(name) {
        return name.indexOf(' ') === -1 && name.length > 11;
      }
    }
  });
});