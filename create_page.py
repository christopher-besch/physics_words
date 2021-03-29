from jinja2 import Template, StrictUndefined
import os


def write_template(file_name, **variables):
    with open(file_name, "r", encoding="utf-8") as file:
        template = Template(file.read(), undefined=StrictUndefined)

    out = template.render(**variables)
    with open(f"out_int/{file_name}", "w+", encoding="utf-8") as file:
        file.write(out)


def load_font(name):
    chars = {}
    with open(f"fonts/{name}.txt", "r", encoding="utf-8") as file:
        height = int(file.readline().split(":")[-1])
        spacing = int(file.readline().split(":")[-1])
        while line := file.readline():
            if line[0] == "-":
                code = int(line[1:])
                char = []
                for _ in range(0, height):
                    char.append(list(file.readline().strip("\n"))[::2])
                chars[code] = char
    return (chars, height, spacing)


def render_text(input, font_chars, height, spacing):
    # rows to be printed
    output_lines = []
    for input_line in input.split("\n"):
        # filling lines with pixels of one char after another
        new_output_lines = [[] for _ in range(height)]
        for input_char in input_line:
            # convert input char into array of pixels
            output_char_rows = font_chars[ord(input_char)]
            for new_output_line, output_char_row in zip(new_output_lines, output_char_rows):
                new_output_line += output_char_row
        output_lines += new_output_lines

    output_strings = ["".join(line) for line in output_lines]
    text = "\",\"".join(output_strings)
    return f'"{text}"'.replace("_", "#").replace("|", "#")


def load_text():
    with open("text.txt", "r", encoding="utf-8") as file:
        text = file.read()
    return "\n".join(line.strip() for line in text.split("\n")).strip()


def main():
    if not os.path.isdir("out_int"):
        os.mkdir("out_int")

    # html
    variables = {
        "title": "Hello Word!"
    }
    write_template("index.html", **variables)
    # js
    raw_text = load_text()
    font = load_font("block")
    text = render_text(raw_text, *font)

    write_template("script.js",
                   text=text,
                   default_cube_width=9,
                   default_cube_height=9,
                   default_x_padding=1,
                   default_y_padding=1,
                   default_speed=50)
    # css
    write_template("style.css")


if __name__ == "__main__":
    main()
