socket.on('availableOffers', offers => {
  console.log('NEW OFFER AWAITING', offers);
  createOffersEl(offers);
})
socket.on('newOffersAwaiting', offers => {
  console.log('NEW OFFER AWAITING', offers);
  createOffersEl(offers);
})

socket.on('answererResponse', offerObj => {
  addAnswer(offerObj);
})

socket.on('receivedIceCandidateFromServer', iceCandidate => {
  addNewIceCandidate(iceCandidate);
})

const createOffersEl = (offers) => {
  const ansEl = document.querySelector('#answer');
  offers.forEach(offer => {
    console.log(offer);
    const newOfferEl = document.createElement('div');
    newOfferEl.innerHTML = `<button class="btn btn-success">Answer ${offer.offererUsername}</button>`;
    newOfferEl.addEventListener('click', () => answerOffer(offer));
    ansEl.appendChild(newOfferEl);
  })
}