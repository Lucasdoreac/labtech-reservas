// Converte um evento salvo (formato da API) nos campos do formulário, para
// continuar editando um rascunho.
export const eventToFormData = (eventToEdit, courseName, odsTypes = []) => ({
  tituloEvento: eventToEdit.name,
  telefone: eventToEdit.organizer.phone,
  classificacao: eventToEdit.eventTypeId,
  ods: eventToEdit.odsId,
  odsId: eventToEdit.odsId,
  odsName: odsTypes.find(
    (ods) => String(ods.id) === String(eventToEdit.odsId)
  )?.formatted,
  descricaoEvento: eventToEdit.description,
  courseId: eventToEdit.graduationId,
  courseName: courseName,
  publicoAlvo: eventToEdit.targetPublic,
  recursosNecessarios: eventToEdit.resources,
  numeroParticipantes: eventToEdit.expectedSubscribers,
  espacos: eventToEdit.roomType,
  trilha: eventToEdit.entrepreneuralPath ? "sim" : "nao",
  trilhaDesc: eventToEdit.entrepreneuralPath,
  projeto: eventToEdit.extensionProject ? "sim" : "nao",
  projetoDesc: eventToEdit.extensionProject,
  alunosMonitores: eventToEdit.studentsMonitors,
  // Logo do próprio evento. Antes: URL fixa do ícone do e-mail de login
  // num host de produção (dwcorp.com.br:9000).
  logo: eventToEdit.eventLogo || null,
});
