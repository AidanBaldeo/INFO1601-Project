(function () {
  function hasConfig() {
    const config = window.FIREBASE_CONFIG;
    return config && typeof config === "object" && config.apiKey && config.projectId;
  }

  let auth = null;
  let db = null;

  function initialize() {
    if (!window.firebase || !hasConfig()) {
      document.dispatchEvent(new Event("firebase:ready"));
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }

    auth = firebase.auth();
    db = firebase.firestore();
    document.dispatchEvent(new Event("firebase:ready"));
  }

  function isReady() {
    return Boolean(auth && db);
  }

  function bossDocId(name) {
    return encodeURIComponent(name.toLowerCase().trim());
  }

  async function signUp(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  async function signIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signOut() {
    return auth.signOut();
  }

  function onAuthStateChanged(callback) {
    if (!isReady()) {
      callback(null);
      return function () {};
    }

    return auth.onAuthStateChanged(callback);
  }

  async function saveUserProfile(uid, profile) {
    return db.collection("users").doc(uid).set(
      {
        username: profile.username,
        email: profile.email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }

  async function saveBossToList(uid, boss) {
    const id = bossDocId(boss.name);
    return db.collection("users").doc(uid).collection("bossList").doc(id).set({
      name: boss.name,
      location: boss.location,
      image: boss.image || "",
      addedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async function removeBossFromList(uid, bossName) {
    const id = bossDocId(bossName);
    return db.collection("users").doc(uid).collection("bossList").doc(id).delete();
  }

  async function saveRating(uid, ratingData) {
    const id = bossDocId(ratingData.name);
    return db.collection("users").doc(uid).collection("ratings").doc(id).set({
      name: ratingData.name,
      location: ratingData.location,
      rating: Number(ratingData.rating),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async function loadBossList(uid) {
    const snapshot = await db.collection("users").doc(uid).collection("bossList").get();
    return snapshot.docs.map(function (doc) {
      return doc.data();
    });
  }

  async function loadRatings(uid) {
    const snapshot = await db.collection("users").doc(uid).collection("ratings").get();
    return snapshot.docs.map(function (doc) {
      return doc.data();
    });
  }

  window.firebaseClient = {
    isReady: isReady,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    onAuthStateChanged: onAuthStateChanged,
    saveUserProfile: saveUserProfile,
    saveBossToList: saveBossToList,
    removeBossFromList: removeBossFromList,
    saveRating: saveRating,
    loadBossList: loadBossList,
    loadRatings: loadRatings
  };

  initialize();
})();
