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
      formMessage: null,
      modalVisible: false
    },

    computed: {
      // ORDER BY yesOnCRA ASC, partyCode ASC, name ASC
      sortedPoliticians: function() {
        return this.politicians.sort(function(a, b){
          if (a.yesOnCRA === b.yesOnCRA) {
            if (a.partyCode === b.partyCode) {
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
            else if (a.partyCode < b.partyCode) {
              return -1;
            }
            else {
              return 1;
            }
          }
          else if (a.yesOnCRA) {
            return 1;
          }
          else {
            return -1;
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

      senatorsInState: function() {
        var self = this;
        return this.senators.filter(function(p){
          return p.state === self.selectedState;
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
      
      // this function needs to change once we add house members because it counts all.
      senateCRACount: function () {
        return this.politicians.filter(function(p){
          return p.yesOnCRA
        }).length
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
        this.$http.get('https://data.battleforthenet.com/politicians.json').then(function(response){
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
            self.formMessage = null;
            self.showModal();
          }
          else {
            self.formMessage = "That didn't work for some reason :(";
          }
        });
      },

      getMetaContent: function(name) {
        var el = document.querySelector('meta[name="' + name + '"]') || document.querySelector('meta[property="' + name + '"]');
        
        if (el) {
          return el.getAttribute('content');
        }

        return null;
      },

      openPopup: function(url, title='popup', w=600, h=500) {
        // Fixes dual-screen position
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
          newWindow.focus();
        }
      },

      shareOnFacebook: function() {
        var url = this.getMetaContent('og:url');
        this.openPopup('https://www.facebook.com/sharer.php?u=' + encodeURIComponent(url), 'facebook');
      },

      shareOnTwitter: function() {
        var tweetText = this.getMetaContent('twitter:description') + ' ' + this.getMetaContent('twitter:url');
        this.openPopup('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText), 'twitter');
      },

      showModal: function() {
        this.modalVisible = true;
        document.querySelector('body').classList.add('modal-open');
      },

      hideModal: function() {
        this.modalVisible = false;
        document.querySelector('body').classList.remove('modal-open');
      }
    }
  });

  Vue.component('politician-card', {
    template: '#politician-card-template',
    props: [ 'politician' ],
    methods: {
      imageURL: function(pol, suffix='_x1') {
        return 'https://www.battleforthenet.com/images/scoreboard/' +  pol.biocode + suffix + '.jpg';
      },

      isLong: function(name) {
        return name.indexOf(' ') === -1 && name.length > 11;
      },

      tweetURL: function(pol) {
        var tweetText;

        if (pol.yesOnCRA) {
          tweetText = '.@' + pol.twitter + ', I will only be voting for folks (like you) who are voting for the CRA to save #NetNeutrality. Thanks!\n\n(Friends: text "VOTE" to 384-387 to make this same pledge to your reps. VoteForNetNeutrality.com will text you how they voted, right before the election.)';
        }
        else {
          tweetText = '.@' + pol.twitter + ' just FYI, I will not be voting for anyone who doesn’t vote for the CRA to save #NetNeutrality.\n\n(Friends: text "VOTE" to 384-387 to make this same pledge to your reps! VoteForNetNeutrality.com will text you how they voted, right before the election!)'
        }

        return 'https://twitter.com/intent/tweet?url=http%3A%2F%2Fwww.votefornetneutrality.com&text=' + encodeURIComponent(tweetText);
      },

      openTweetURL: function(pol) {
        var url = this.tweetURL(pol);
        window.open(url, '_blank');
      }
    }
  });
});