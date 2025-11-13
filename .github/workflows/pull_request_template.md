## Description

Décrivez les modifications apportées dans cette Pull Request.  
Précisez le contexte, les fichiers concernés, et les objectifs visés.

---

## Type de changement

Indiquez le type de changement effectué :

- Nouvelle fonctionnalité 
- Correction de bug 
- Refactorisation 
- Mise à jour de documentation 
- Ajout de tests 

---

##  Comment tester cette PR

Expliquez comment tester les changements localement :

1. Cloner le dépôt et installer les dépendances :
    git clone <url-du-dépôt>
    cd <nom-du-dossier>

2. Installer les dépendances :
    npm install

3. Lancer le serveur en mode développement :
    npm run dev

3. Vérifier les endpoints modifiés via Swagger :
    http://localhost:3000/api-docs

4. Lancer les tests avec couverture :
    npm test -- --coverage

5. Vérifier le lint et le formatage :
    npm run lint
    npm run format


## Liens utiles

- [Documentation Swagger](http://localhost:3000/api-docs)  
- [Dashboard Codacy](https://app.codacy.com/gh/Babajii91/test_qualit-_projet/dashboard)  
- [GitHub Actions](https://github.com/Babajii91/test_qualit-_projet/actions)  