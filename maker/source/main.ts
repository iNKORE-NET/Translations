


//console.log(scriptPath);

import chalk from "chalk";
import Check from "./entries/check";
import { getAllNamespaces } from "./utils/get-all-items";

// console.log(PangulasSpacingValidator.validate("中文English"));
// console.log(PangulasSpacingValidator.validate("中文 English中文"));

// console.log(PangulasSpacingValidator.validate("中文 English"));
// console.log(PangulasSpacingValidator.validate("中文 English 中文"));

// console.log(PangulasSpacingValidator.validate("中𠮷English 中文"));
// console.log(PangulasSpacingValidator.validate("中𠮷 English 中文"));

// console.log(PangulasSpacingValidator.validate("中(𠮷中)文"));
// console.log(PangulasSpacingValidator.validate("中 (𠮷中) 文"));
// console.log(PangulasSpacingValidator.validate("中 (Eng) En 文"));

Check();