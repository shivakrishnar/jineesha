select
	qbmca.ID as id,
	qb.CompanyID as companyId,
	comp.CompanyName as companyName,
	qbmca.ATQuestionBankID as atQuestionBankId,
	qb.QuestionTitle as questionTitle,
	qbmca.Answer as answer
from
	ATQuestionBankMultipleChoiceAnswers qbmca inner join
	ATQuestionBank qb on qbmca.ATQuestionBankID = qb.ID inner join
	Company comp on qb.CompanyID = comp.ID
where
	qbmca.ID = @id