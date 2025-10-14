# Configuração DNS para datachem.com.br

## Problema Identificado
O site não está acessível em `https://datachem.com.br/` porque a configuração DNS não está completa.

## Solução Implementada
Alteramos o CNAME para usar `www.datachem.com.br` em vez do domínio apex.

## Configuração DNS Necessária

### No seu provedor de DNS (onde o domínio datachem.com.br está registrado):

1. **Criar registro CNAME para www:**
   - Nome/Host: `www`
   - Valor/Destino: `leandrocodegit.github.io`
   - TTL: 3600 (ou padrão)

2. **Opcional - Redirecionamento do domínio apex:**
   Para que `datachem.com.br` redirecione para `www.datachem.com.br`, você pode:
   
   **Opção A: Registros A (Recomendado)**
   - Nome/Host: `@` ou deixe em branco (domínio raiz)
   - Valores: Criar 4 registros A com os IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153

   **Opção B: Redirecionamento HTTP (se suportado pelo provedor)**
   - Configurar redirecionamento de `datachem.com.br` para `www.datachem.com.br`

## Verificação
Após configurar o DNS, aguarde até 24 horas para propagação e teste:
- `https://www.datachem.com.br/`
- `https://datachem.com.br/` (se configurou os registros A)

## Comandos para verificar DNS (opcional)
```bash
# Verificar CNAME
nslookup www.datachem.com.br

# Verificar registros A (se configurados)
nslookup datachem.com.br
```

## Status Atual
- ✅ GitHub Pages configurado
- ✅ CNAME atualizado para www.datachem.com.br
- ⏳ Aguardando configuração DNS no provedor