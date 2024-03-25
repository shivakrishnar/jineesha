select ATApplicationVersionID as aTApplicationVersionID,
	   ATQuestionBankID as aTQuestionBankID
from ATApplicationVersionCustomQuestion
where ATApplicationVersionID = @ATApplicationVersionID and
      ATQuestionBankID = @ATQuestionBankID