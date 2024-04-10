select
	aqba.ID as id,
	jp.CompanyID as companyId,
	comp.CompanyName as companyName,
	aqba.ATApplicationID as atApplicationId,
	aqba.OriginalATQuestionTypeID as originalATQuestionTypeId,
	aqba.OriginalQuestionText as originalQuestionText,
	aqba.AnswerDate as answerDate,
	aqba.AnswerYesNo as answerYesNo,
	aqba.AnswerFreeForm as answerFreeForm,
	aqba.AnswerMultipleChoice as answerMultipleChoice
from
	ATApplicationQuestionBankAnswer aqba inner join
	ATApplication app on aqba.ATApplicationID = app.ID inner join
	ATJobPosting jp on app.ATJobPostingID = jp.ID inner join
	Company comp on jp.CompanyID = comp.ID
where
	aqba.ID = @id