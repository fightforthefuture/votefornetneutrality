document.addEventListener("DOMContentLoaded", function() {
  var TEXT_FLOW_ID = '11ccf7cd-70ac-4ffc-9fab-3f7e118651b2';

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
    el: '#app',

    data: {
      phone: null,
      states: STATES,
      selectedState: null,
      politicians: [],
      isLoaded: false,
      isSubmitting: false,
      formMessage: null
    },

    computed: {
      // ORDER BY yesOnCRA DESC, name ASC
      sortedPoliticians: function() {
        return this.politicians.sort(function(a, b){
          if (a.yesOnCRA === b.yesOnCRA) {
            if (a.name < b.name) {
              return -1;
            }
            else if (a.name > b.name) {
              return 1;
            }
            else {
              return 0;
            }
          }
          else if (a.yesOnCRA) {
            return -1;
          }
          else {
            return 1;
          }
        });
      },

      senators: function() {
        return this.sortedPoliticians.filter(function(p){
          return p.organization === 'Senate';
        });
      },

      representatives: function() {
        return this.sortedPoliticians.filter(function(p){
          return p.organization === 'House';
        });
      },

      congressInState: function() {
        var self = this;
        return this.politicians.filter(function(p){
          return p.state === self.selectedState;
        });
      },

      teamInternet: function() {
        return this.politicians.filter(function(p){
          return p.team === 'team-internet';
        });
      },

      undecided: function() {
        return this.politicians.filter(function(p){
          return p.team === 'undecided';
        });
      },

      teamCable: function() {
        return this.politicians.filter(function(p){
          return p.team === 'team-cable';
        });
      },

      senateCRACount: function () {
        return this.politicians.filter(function(p){
          return p.yesOnCRA
        }).length
      }
    },

    created: function() {
      // this.geocodeSelectedState();
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
            self.isLoaded = true;
          }
        });
      },

      submitForm: function() {
        var self = this;
        this.isSubmitting = true;
        this.$http.post(
          'https://zbqszazfe5.execute-api.us-east-1.amazonaws.com/v1/flow-starts',
          { 
            flow: TEXT_FLOW_ID,
            phone: this.phone
          }
        ).then(function(response){
          self.isSubmitting = false;
          
          if (response.ok && response.body.status === 'pending') {
            self.phone = null;
            self.formMessage = "Thanks! Our bot will be in touch :)";
          }
          else {
            self.formMessage = "That didn't work for some reason :(";
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
      },

      tweetURL: function(pol) {
        const proNNtweet = ',%20I%20will%20only%20be%20voting%20for%20folks%20(like%20you)%20who%20are%20voting%20for%20the%20CRA%20to%20save%20%23NetNeutrality.%20Thanks!%0A%0A(Friends%3A%20text%20%E2%80%9CVOTE%E2%80%9D%20to%20384-387%20to%20make%20this%20same%20pledge%20to%20your%20reps.%20VoteForNetNeutrality.com%20will%20text%20you%20how%20they%20voted,%20right%20before%20the%20election.)' 
        const antiNNtweet = '%20just%20FYI,%20I%20will%20not%20be%20voting%20for%20anyone%20who%20doesn%E2%80%99t%20vote%20for%20the%20CRA%20to%20save%20%23NetNeutrality.%0A%0A(Friends%3A%20text%20%22VOTE%22%20to%20384-387%20to%20make%20this%20same%20pledge%20to%20your%20reps!%20VoteForNetNeutrality.com%20will%20text%20you%20how%20they%20voted,%20right%20before%20the%20election!)'
        const tweetURLprefix = 'https://twitter.com/intent/tweet?text='
        return tweetURLprefix + '.@' + pol.twitter + (pol.yesOnCRA ? proNNtweet : antiNNtweet)
      }
    }
  });
});