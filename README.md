# DataChem 🧪

Uma aplicação web moderna para busca e visualização de dados de substâncias químicas, integrada com a API do PubChem Database e Firebase para histórico de pesquisas.

## 🚀 Funcionalidades

- **Busca Inteligente**: Pesquise compostos químicos por nome, fórmula molecular ou CID
- **Visualização Detalhada**: Exiba informações completas dos compostos incluindo:
  - Estrutura molecular 2D
  - Propriedades físico-químicas
  - Fórmula molecular e peso molecular
  - Sinônimos e nomes alternativos
- **Histórico de Pesquisas**: Salve e acesse suas pesquisas anteriores com Firebase
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos
- **Performance Otimizada**: Carregamento rápido e experiência fluida

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Estilização**: Styled Components
- **API**: PubChem REST API
- **Backend**: Firebase Firestore
- **Build Tool**: Vite
- **Linguagem**: JavaScript (ES6+)

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/LeandroCostaeSilva/DataChem.git
   cd DataChem
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative o Firestore Database
   - Configure as regras de segurança do Firestore:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Atualize as configurações no arquivo `src/firebase.js` com suas credenciais

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - Abra seu navegador em `http://localhost:5173`

## 🎯 Como Usar

1. **Pesquisar Compostos**:
   - Digite o nome, fórmula ou CID do composto na barra de pesquisa
   - Pressione Enter ou clique no botão de busca
   - Aguarde o carregamento dos dados

2. **Visualizar Resultados**:
   - Veja a estrutura molecular 2D
   - Explore as propriedades físico-químicas
   - Confira sinônimos e informações adicionais

3. **Histórico de Pesquisas**:
   - Suas pesquisas são automaticamente salvas
   - Clique em qualquer item do histórico para repetir a busca
   - O histórico é persistente entre sessões

## 📁 Estrutura do Projeto

```
DataChem/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── CompoundDetails.jsx    # Exibição dos detalhes do composto
│   │   ├── SearchBox.jsx          # Componente de busca
│   │   └── SearchHistory.jsx      # Histórico de pesquisas
│   ├── services/
│   │   ├── firebaseService.js     # Serviços do Firebase
│   │   └── pubchemService.js      # Integração com PubChem API
│   ├── App.jsx                    # Componente principal
│   ├── firebase.js                # Configuração do Firebase
│   ├── main.jsx                   # Ponto de entrada
│   └── index.css                  # Estilos globais
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter ESLint

## 🌐 API Utilizada

- **PubChem REST API**: Base de dados química pública do NCBI
- **Endpoints principais**:
  - Busca por nome: `/rest/pug/compound/name/{compound}/JSON`
  - Busca por CID: `/rest/pug/compound/cid/{cid}/JSON`
  - Imagens 2D: `/rest/pug/compound/cid/{cid}/PNG`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Leandro Costa e Silva**
- GitHub: [@LeandroCostaeSilva](https://github.com/LeandroCostaeSilva)
- LinkedIn: [Leandro Costa e Silva](https://linkedin.com/in/leandro-costa-e-silva)

## 🙏 Agradecimentos

- [PubChem](https://pubchem.ncbi.nlm.nih.gov/) pela API pública de dados químicos
- [Firebase](https://firebase.google.com/) pela infraestrutura de backend
- [React](https://reactjs.org/) pela biblioteca de interface
- [Vite](https://vitejs.dev/) pela ferramenta de build rápida

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
