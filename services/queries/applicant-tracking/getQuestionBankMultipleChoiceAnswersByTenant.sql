declare @_searchBy nvarchar(50) = @searchBy

select count(*) as totalCount
from
	ATQuestionBankMultipleChoiceAnswers qbmca inner join
	ATQuestionBank qb on qbmca.ATQuestionBankID = qb.ID inner join
	Company comp on qb.CompanyID = comp.ID
where
	concat(qb.QuestionTitle, qbmca.Answer) like '%' + @_searchBy + '%'

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
	concat(qb.QuestionTitle, qbmca.Answer) like '%' + @_searchBy + '%'
order by
	comp.CompanyName,
    qb.QuestionTitle,
	qbmca.Answer