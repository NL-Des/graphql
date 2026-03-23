// Variable constantes
const urlSignin = "https://zone01normandie.org/api/auth/signin";
const urlGraphQL = "https://zone01normandie.org/graphql-engine/v1/graphql";
let tokenJWT = ""

async function orchestration () {
    const data = recoltLogin();
    const dataBase64 = translationInBase64(data.username, data.password);
    const credentialsToSend = await sendCredentials(dataBase64)

    if(credentialsToSend.ok) {
        tokenJWT = await credentialsToSend.json();
        console.log("Connexion réussis :", tokenJWT)
        const dataFormat = formatRequest()
        const graphqlData = downloadJSON(tokenJWT, dataFormat)
            if(graphqlData.ok) {
                console.log("Connexion avec le Token réussie. Récupération des données de GraphQL :", graphqlData)
            } else {
                console.log("Connexion avec le Token échouée.", graphqlData.status)
            }
        
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
    const connexion = await fetch(urlSignin, {
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
    
    // Appel de la fonction si l'utilisateur appuye sur le bouton.
    orchestration();
});

function formatRequest() {
    const query = {
        query:`
            query {
                user {
                    login
                    id
                    firstName
                    lasName
                }
            }
        }
        `
    }
return query
}

// Téléchargement du JSON des données de l'API.
async function downloadJSON(tokenJWT, dataFormat) {
    const connexion = await fetch(urlGraphQL, {
        method: 'POST',
        headers: {
            // Le Bearer est pour renvoyer le token d'identiication plutôt
            // que de répéter le processus de connexion à chaque fois.
            'Authorization': `Bearer ${tokenJWT}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFormat)
    })
    return connexion
}