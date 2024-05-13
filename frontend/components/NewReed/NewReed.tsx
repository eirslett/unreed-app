import { useId, useState } from 'react';
import { Field, SelectField, TextField } from '../Form/Form';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Textarea } from '../Textarea/Textarea';
import { Button, Buttons } from '../Button/Button';

export function NewReedRoute() {
  return <NewReedPage />;
}

export function NewReedPage() {
  const [color, setColor] = useState<string | undefined>(undefined);

  return (
    <form>
      <h1>New Reed</h1>
      <h2>Recognizing the reed</h2>
      <SelectField name="reedType" label="Reed type">
        <option>Oboe</option>
        <option>English horn</option>
      </SelectField>
      <TextField
        name="reedIdentification"
        label="Identification"
        placeholder="Reed ID/number/code/name"
        required
      />
      <Field>
        <label>Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </Field>
      <h2>Which cane is used?</h2>
      {/*
      OLD code looks like this:
      <div className="box">
          <h2 className="subtitle is-4">Which cane is used?</h2>
          <TextInput
            data={data}
            setValue={setValue}
            name="caneProducer"
            description="Cane Producer"
            placeholder="Glotin, Alliaud, Rigotti..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="caneDiameter"
            description="Cane Diameter"
            placeholder="10, 10.0-10.5, 11..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="caneHardness"
            description="Cane Hardness"
            placeholder="soft/medium/hard, 9, 10, 11..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="caneDensity"
            description="Cane Density"
            placeholder="-50, -60..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="gougeThickness"
            description="Gouge Thickness"
            placeholder="56, 58-60, maybe thin sides..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="shaperForm"
            description="Shaper Form"
            placeholder="Klopfer 722, RC12, Rigoutat -2..."
          />
        </div>
      */}
      <TextField
        name="caneProducer"
        label="Cane Producer"
        placeholder="Glotin, Alliaud, Rigotti..."
      />
      <TextField name="caneDiameter" label="Cane Diameter" placeholder="10, 10.0-10.5, 11..." />
      <TextField
        name="caneHardness"
        label="Cane Hardness"
        placeholder="soft/medium/hard, 9, 10, 11..."
      />
      <TextField name="caneDensity" label="Cane Density" placeholder="-50, -60..." />
      <TextField
        name="gougeThickness"
        label="Gouge Thickness"
        placeholder="56, 58-60, maybe thin sides..."
      />
      <TextField
        name="shaperForm"
        label="Shaper Form"
        placeholder="Klopfer 722, RC12, Rigoutat -2..."
      />
      {/*
      OLD code looks like this:
      <div className="box">
          <h2 className="subtitle is-4">Which staple is used?</h2>
          <TextInput
            data={data}
            setValue={setValue}
            name="stapleModel"
            description="Staple Model"
            placeholder="Loree, RC2, Chiarugi 2, Marigaux 1 SL, Klopfer D11..."
          />
          <TextInput
            data={data}
            setValue={setValue}
            name="stapleLength"
            description="Staple Length"
            placeholder="46 mm, 47 mm..."
          />
        </div>

        <hr />

        <div className="box">
          <h2 className="subtitle is-4">Other information</h2>
          <TextInput
            data={data}
            setValue={setValue}
            name="tiedReedLength"
            description="Initial Tied Reed Length (before clipping)"
            placeholder="73 mm, 75 mm..."
          />

          <hr />

          <div className="field">
            <label className="label" htmlFor="comments">
              Comments
            </label>
            <div className="control">
              <textarea
                name="comments"
                className="textarea"
                placeholder="General comments about the reed blank"
                value={data.comments}
                onChange={(e) => setValue('comments', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="field is-grouped">
          <p className="control">
            <input type="submit" className="button is-primary" value="Register this reed" />
          </p>
          <span className="control">
            <A className="button is-light is-danger" href="/">
              Cancel
            </A>
          </span>
        </div>
      */}
      <h2>Which staple is used?</h2>
      <TextField
        name="stapleModel"
        label="Staple Model"
        placeholder="Loree, RC2, Chiarugi 2, Marigaux 1 SL, Klopfer D11..."
      />
      <TextField name="stapleLength" label="Staple Length" placeholder="46 mm, 47 mm..." />

      <h2>Other information</h2>
      <TextField
        name="tiedReedLength"
        label="Initial Tied Reed Length (before clipping)"
        placeholder="73 mm, 75 mm..."
      />

      <Field>
        <label>Comments</label>
        <Textarea name="comments" placeholder="General comments about the reed blank" />
      </Field>

      <Buttons>
        <Button type="submit" variant="primary">
          Register this reed
        </Button>
        <Button variant="warning">Cancel</Button>
      </Buttons>
    </form>
  );
}
