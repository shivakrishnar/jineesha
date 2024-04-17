update ATApplicationQuestionBankAnswer set
	OriginalATQuestionTypeID = @OriginalATQuestionTypeID,
	ATApplicationID = @ATApplicationID,
	OriginalQuestionText = @OriginalQuestionText,
	AnswerDate = @AnswerDate,
	AnswerYesNo = @AnswerYesNo,
	AnswerFreeForm = @AnswerFreeForm,
	AnswerMultipleChoice = @AnswerMultipleChoice
where
	ID = @ID
