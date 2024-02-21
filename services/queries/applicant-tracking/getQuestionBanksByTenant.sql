select
	count(*) as totalCount
from
	ATQuestionBank

select
	qb.ID as id,
	qb.CompanyID as companyId,
	comp.CompanyName as companyName,
	qb.ATQuestionTypeID as atQuestionTypeId,
	qb.QuestionTitle as questionTitle,
	qb.QuestionText as questionText,
	qb.Active as active,
	qb.Sequence as sequence,
	qb.IsRequired as isRequired
from
	ATQuestionBank qb inner join
	Company comp on qb.CompanyID = comp.ID
where
	concat(qb.QuestionTitle, qb.QuestionText) like '%' + @searchBy + '%'
order by
	comp.CompanyName,
	qb.Sequence,
    qb.QuestionTitle
