const isspace = c => c == ' ' || c == '\t' || c == '\n' || c == '\r';
const isdigit = c => '0' <= c && c <= '9';
const isalpha = c => 'A' <= c && c <= 'Z' || 'a' <= c && c <= 'z';
const isalnum = c => isalpha(c) || isdigit(c);

// #3b4a62, #dbdeeb, #fe9841
const defaultColors = {
  "number": "#affaff",
  "comment": "#3b3b3b",
  "string": "#affaff",
  "keyword": "#fe9841",
  "type": "#fe9841",
};
const defaultKeywords = ["const", "static", "extern", "auto", "case", "switch", "if", "else", "return", "sizeof", "struct", "enum", "union", "alias", "template"];
const defaultTypes = ["void", "unsigned", "int", "float", "uintptr_t", "intptr_t", "uint8_t", "uint16_t", "size_t", "string"]
const defaultCommentStyle = "//";

/* takes text, returns html */
function colorize(src, { colors = defaultColors, keywords = defaultKeywords, types = defaultTypes, comment_style = defaultCommentStyle } = {}) {
  let out_html = "";
  let pos = 0;
  while (true) {
    while (pos < src.length && isspace(src[pos])) out_html += src[pos++];
    let token_type = null;
    let i = 1;

    if (pos >= src.length) break;
    else if (isalpha(src[pos]) || src[pos] == '_') {
      token_type = "ident";
      while (pos + i < src.length && (isalnum(src[pos + i]) || src[pos + i] == '_')) ++i;
      if (keywords.includes(src.slice(pos, pos + i))) token_type = "keyword";
      else if (types.includes(src.slice(pos, pos + i))) token_type = "type";
    } else if (pos + (comment_style.length - 1) < src.length && src.slice(pos, pos + comment_style.length) == comment_style) {
      token_type = "comment";
      while (pos + i < src.length && src[pos + i] != '\n') ++i;
      ++i;
    } else if (src[pos] == '"') {
      token_type = "string";
      while (pos + i < src.length && (src[pos + i - 1] == '\\' || src[pos + i] != '"')) ++i;
      if (pos + i >= src.length || src[pos + i] != '"') console.warn("colorizer: unterminated string");
      ++i;
    } else if (isdigit(src[pos])) {
      token_type = "number";
      while (pos + i < src.length && (isdigit(src[pos + i]) || src[pos + i] == '.')) ++i;
      if (pos + i < src.length && src[pos + i].toLowerCase() == 'f') ++i;
    } else if (src[pos] in colors) token_type = src[pos];

    let err = false;
    if (token_type == null) {
      console.warn(`colorizer: unhandled token entrant '${src[pos]}'`);
      err = true;
    } else if (colors[token_type] === undefined) {
      console.warn(`colorizer: colors["${token_type}"] not defined`);
      err = true;
    }

    if (!err)
      out_html += `<span class="token.${token_type}" style="color:${colors[token_type]}">`;
    out_html += src.slice(pos, pos + i);
    pos += i;
    if (!err)
      out_html += "</span>";
  }
  return out_html;
}
