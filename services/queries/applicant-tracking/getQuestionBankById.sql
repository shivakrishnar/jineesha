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
	qb.ID = @id