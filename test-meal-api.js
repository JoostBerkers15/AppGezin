const axios = require('axios');

const testMeal = {
  id: Date.now().toString(),
  dish: "Test Maaltijd",
  date: "2025-11-20",
  mealType: "dinner",
  location: "home",
  locationDetails: "",
  participants: [],
  recurring: undefined
};

console.log('Sending meal data:', JSON.stringify(testMeal, null, 2));

axios.post('http://localhost:8000/api/meals', testMeal)
  .then(response => {
    console.log('Success!');
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.log('Error!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  });

