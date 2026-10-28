# Especificação de Segurança (Security Spec) - Meu Dinheiro em Dia

## 1. Invariantes de Dados e Privacidade
1. **Isolamento de Dados Monetários Privados**: Valores monetários em reais (`targetAmount`, `currentAmount`, `amount`), histórico de transações/movimentações e saldos pertencem estritamente à coleção privada `/goals` e `/movements`.
2. **Impossibilidade de Leitura de Metas Privadas por Convidados**: Apenas o proprietário autenticado (`request.auth.uid == resource.data.ownerId`) tem permissão de leitura (`get` ou `list`) nas coleções `/goals` e `/movements`.
3. **Projeção Pública Mínima Isolada**: A coleção `/shared_goals` armazena exclusivamente percentuais calculados (`progressPercentage`, `remainingPercentage`), o identificador público, o nome público e o estado da meta. É matematicamente impossível para um convidado inferir valores absolutos em R$.
4. **Revogação Instantânea**: Se `revoked == true`, a meta compartilhada não pode ser acessada por novos convidados.
5. **Restrição de Acesso a Convidados Autorizados**: Um usuário só pode visualizar (`get` ou `list`) metas em `/shared_goals` se for o proprietário ou se seu UID ou e-mail estiver na lista de convidados autorizados (`allowedGuestUids`, `allowedGuestEmails`) ou possuir o código de convite correspondente.
6. **Integridade de Identidade**: Nenhum usuário pode forjar `ownerId` ou atribuir a propriedade de uma meta a outro usuário durante `create` ou `update`.
7. **Limitação Numérica de Progresso**: O percentual de progresso é sempre limitado entre 0% e 100%.

## 2. The "Dirty Dozen" Payloads (Ataques Previstos)
1. **Guest Direct Read**: Convidado autenticado tenta ler `/goals/{goalId}` de outro usuário para ver o saldo em R$. -> `PERMISSION_DENIED`.
2. **Unauthenticated Query**: Usuário anônimo tenta listar `/goals`. -> `PERMISSION_DENIED`.
3. **Owner Spoofing on Goal Create**: Usuário autenticado `userA` tenta criar uma meta com `ownerId: "userB"`. -> `PERMISSION_DENIED`.
4. **Owner Modification on Goal Update**: Usuário autenticado tenta alterar `ownerId` de uma meta existente. -> `PERMISSION_DENIED`.
5. **Private Movement Snooping**: Convidado tenta ler `/movements/{movementId}` de depósitos do proprietário. -> `PERMISSION_DENIED`.
6. **Malicious Negative Movement**: Usuário tenta criar uma movimentação com valor negativo (`amount < 0`). -> `PERMISSION_DENIED`.
7. **Unauthorized Share Mutation**: Convidado tenta alterar o `publicTitle` ou `progressPercentage` em `/shared_goals/{shareId}`. -> `PERMISSION_DENIED`.
8. **Unauthorized Share Revocation**: Usuário não proprietário tenta marcar `revoked: true` em uma meta compartilhada alheia. -> `PERMISSION_DENIED`.
9. **Guest Privilege Escalation**: Convidado tenta se adicionar como proprietário da meta compartilhada. -> `PERMISSION_DENIED`.
10. **Data Injection Attack**: Injeção de string de 100KB no campo `name` ou documentId malicioso. -> `PERMISSION_DENIED`.
11. **Negative Target Amount**: Criação de meta com `targetAmount <= 0`. -> `PERMISSION_DENIED`.
12. **Public Projection Exposure**: Tentativa de salvar campos confidenciais (`targetAmount`, `currentAmount`, `deposits`) no documento `/shared_goals`. -> `PERMISSION_DENIED`.
