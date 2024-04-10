insert into ATApplicationQuestionBankAnswer (
	OriginalATQuestionTypeID,
	ATApplicationID,
	OriginalQuestionText,
	AnswerDate,
	AnswerYesNo,
	AnswerFreeForm,
	AnswerMultipleChoice
) values (
	@OriginalATQuestionTypeID,
	@ATApplicationID,
	@OriginalQuestionText,
	@AnswerDate,
	@AnswerYesNo,
	@AnswerFreeForm,
	@AnswerMultipleChoice
)
select SCOPE_IDENTITY() as ID