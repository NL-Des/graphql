// Variable constantes
const url = "https://zone01normandie.org/intra/rouen/profile/api/auth/signin";

async function orchestration () {
    const data = recoltLogin();
    const dataBase64 = translationInBase64(data.username, data.password);
    const credentialsToSend = await sendCredentials(dataBase64)

    if(credentialsToSend.ok) {
        const result = await credentialsToSend.json();
        console.log("Connexion réussis :", result)
    } else {
        console.log("Connexion échouée :", credentialsToSend.status)
    }
}

// Récupération du login
function recoltLogin() {
    const username = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    return {username, password}
}

// Le login est traduis en Base64
function translationInBase64(username, password) {
    // Conversion des chaînes de caractères en base64
    // Afin de pouvoir les envoyer après au serveur.
    const credentials = btoa(`${username}:${password}`);
    return credentials
}

async function sendCredentials (credentials) {
    const connexion = await fetch(url, {
        method: 'POST',
        headers: {
            // Le Basic est le nom du schéma d'authendification.
            // Il attend le format suivant : "username:password", encodé en Bas64.
            // C'est pour le protocole d'authentification HTTP.
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
        }
    })
    return connexion
}

// Ecoute du bouton "Connexion"
const btn = document.getElementById('btn-login');

btn.addEventListener('click', function(event) {
    // Empêche le rechargement de la page (comportement par défaut du type="submit")
    // Ce qui nous évite de perdre les données si la page devait se recharger.
    event.preventDefault(); 
    
    // Appelle de la fonction si l'utilisateur appuye sur le bouton.
    orchestration();
});