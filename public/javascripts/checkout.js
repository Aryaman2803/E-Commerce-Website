var stripe = Stripe(
  "pk_test_51IL7crIfc54TOuJG98X9YOmmZhcPktdqTzsT1hQJxtCNcPOpn5VpCltqWRAjQGtV2XN2KXAPtg2u0YBfJch6ztKB00ttySkZAm"
);
var checkoutButton = document.getElementById("checkout-button");

checkoutButton.addEventListener("click", () => {
  fetch("/create-checkout-session", {
    method: "POST",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (session) {
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
      if (result.error) {
        alert(result.error.message);
      }
    })
    .catch(function (error) {
      console.log("Error", error);
    });
});
// var $form = $("#checkout-form");
// $form.submit(function (event) {
//   $form.find("button").prop("disabled", true);

//  stripe.card.createToken()
// });

// var elements = stripe.elements();
// var style = {
//   base: {
//     color: "#32325d",
//   },
// };
// var card = elements.create("card", { style: style });
// card.mount("#card-element");

// card.on("change", ({ error }) => {
//   let displayError = document.getElementById("card-errors");
//   if (error) {
//     displayError.textContent = error.message;
//   } else {
//     displayError.textContent = "";
//   }
// });

// var cardName = elements.create('#card-name');
// var cardNumber = elements.create('#card-number');
// var cardExpiryMonth = elements.create('#card-expiry-month');
// var cardExpiryYear = elements.create('#card-expiry-year');
// var cardCvc = elements.create('#card-cvc');
