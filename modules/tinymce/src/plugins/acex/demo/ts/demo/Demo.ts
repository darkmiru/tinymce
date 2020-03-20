declare let tinymce: any;

const testSet = [
  'Zachary Hawkins',
  'Julie Chavez',
  'Randy Duncan',
  'Lisa Robinson',
  'Jacqueline Reynolds',
  'Paul Weaver',
  'Edward Gilbert',
  'Deborah Butler',
  'Carolyn Munoz',
  'Billy Ramirez',
  'Pamela Walsh',
  'Paul Wade',
  'Katherine Campbell'
];

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'acex code',
  toolbar: 'acex code',
  // toolbar_location: 'bottom',
  height: 600,
  acex: {
    maxResults: 5,
    fetch: (editor, pattern, maxResults) => {
      return new tinymce.util.Promise(function (resolve) {
        let cnt = 0;
        const names = [];
        testSet.some(function (name) {
          const ret = (name.toLowerCase().indexOf(pattern) === 0);
          if (ret === true) {
            cnt++;
            names.push(name);
            if (cnt >= maxResults) {
              return true;
            }
          }
          return false;
        });

        const results = names.map(function (name) {
          const tmp = name.split(' ');
          const initialName = tmp[0].substr(0, 1) + ((tmp.length > 1) ? tmp[1].substr(0, 1) : '');
          return {
            value: name,
            text: name,
            icon: initialName.toUpperCase(),
            meta: {
              // disabled: true,
              desc: name.replace(/\s/g, '') + '@test.cc'
            }
          };
        });
        resolve(results);
      });
    },
    onAction: (editor, autocompleteApi, rng, value, meta) => {
      editor.selection.setRng(rng);
      const insertText = '<a href="mailto:' + meta.desc + '"><span style="text-decoration-line: none;">@' + value + '</span></a>';
      editor.insertContent(insertText);
      autocompleteApi.hide();
    }
  }
});

export {};
