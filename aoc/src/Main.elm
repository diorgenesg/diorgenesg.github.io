port module Main exposing (main)

import Browser exposing (Document)
import File
import File.Select as Select
import Html
import Html.Attributes as Attr
import Html.Events as Evts
import Process
import Random
import Task
import Time


port printElement : String -> Cmd msg


type alias Model =
    { numeroOac : Int
    , nomeCompleto : String
    , telefone : String
    , fuso : Maybe Time.Zone
    , tempo : Maybe Time.Posix
    , offset : Int
    , perfil : Maybe String
    , exibeTexto : Bool
    }


oacGenerator : Random.Generator Int
oacGenerator =
    Random.int 0 999999


initModel : Model
initModel =
    { numeroOac = 0
    , nomeCompleto = ""
    , telefone = ""
    , fuso = Nothing
    , tempo = Nothing
    , offset = 45
    , perfil = Nothing
    , exibeTexto = False
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( initModel, Cmd.batch [ Random.generate OACNumber oacGenerator, Task.perform CurrentZone Time.here ] )


view : Model -> Document Msg
view model =
    { title = "#complexogg - Ordem dos Advogados do Complexo"
    , body =
        [ Html.div [ Attr.id "carteira" ]
            [ Html.div
                [ Attr.class "profileImage"
                , Evts.onClick SelectProfilePic
                , case model.perfil of
                    Nothing ->
                        Attr.class ""

                    Just url ->
                        Attr.style "background-image" ("url(" ++ url ++ ")")
                ]
                []
            , if model.exibeTexto then
                Html.div
                    [ Attr.class "nameInput"
                    , Attr.class "usrData-Big"
                    , Attr.style "text-transform" "none"
                    ]
                    [ Html.text model.nomeCompleto ]

              else
                Html.textarea
                    [ Attr.class "nameInput"
                    , Attr.class "usrData-Big"
                    , Attr.placeholder "Nome"
                    , Attr.maxlength 14
                    , Evts.onInput ChangeNomeCompleto
                    , Attr.value model.nomeCompleto
                    ]
                    []
            , Html.div
                [ Attr.class "oacNumber"
                , Attr.class "container"
                ]
                [ Html.div [ Attr.class "fieldTitle" ]
                    [ Html.text "Número OAC" ]
                , Html.div
                    [ Attr.class "usrData-Small" ]
                    [ Html.text <| "CPX" ++ String.padLeft 6 '0' (String.fromInt model.numeroOac) ]
                ]
            , Html.div
                [ Attr.class "phone"
                , Attr.class "container"
                ]
                [ Html.div [ Attr.class "fieldTitle" ] [ Html.text "Telefone" ]
                , if model.exibeTexto then
                    Html.div
                        [ Attr.class "usrData-Small"
                        , Attr.class "phoneInput"
                        ]
                        [ Html.text <| phoneFormatter model.telefone ]

                  else
                    Html.input
                        [ Evts.onInput ChangeTelefone
                        , Attr.placeholder "XXX-XXX"
                        , Attr.value <| phoneFormatter model.telefone
                        , Attr.class "usrData-Small"
                        , Attr.class "phoneInput"
                        ]
                        []
                ]
            , Html.div
                [ Attr.class "emissionDate"
                , Attr.class "container"
                ]
                [ Html.div [ Attr.class "fieldTitle" ]
                    [ Html.text "Data de Emissão" ]
                , Html.div [ Attr.class "usrData-Small" ]
                    [ Html.text <| showDate model.fuso model.tempo 0 ]
                ]
            , Html.div
                [ Attr.class "expirationDate"
                , Attr.class "container"
                ]
                [ Html.div [ Attr.class "fieldTitle" ]
                    [ Html.text "Data de Validade" ]
                , Html.div [ Attr.class "usrData-Small" ]
                    [ Html.text <| showDate model.fuso model.tempo model.offset ]
                ]
            ]
        , Html.button [ Evts.onClick ShowTextOnly, Attr.class "submit" ] [ Html.text "Emitir carteira" ]
        ]
    }


phoneFormatter : String -> String
phoneFormatter phone =
    if String.length phone <= 3 then
        phone

    else
        let
            eachNumber : List Char
            eachNumber =
                String.toList phone

            first : List Char
            first =
                List.take 3 eachNumber

            last : List Char
            last =
                List.drop 3 eachNumber
        in
        [ first, last ]
            |> List.map String.fromList
            |> String.join "-"


monthString : Time.Month -> String
monthString month =
    case month of
        Time.Jan ->
            "01"

        Time.Feb ->
            "02"

        Time.Mar ->
            "03"

        Time.Apr ->
            "04"

        Time.May ->
            "05"

        Time.Jun ->
            "06"

        Time.Jul ->
            "07"

        Time.Aug ->
            "08"

        Time.Sep ->
            "09"

        Time.Oct ->
            "10"

        Time.Nov ->
            "11"

        Time.Dec ->
            "12"


showDate : Maybe Time.Zone -> Maybe Time.Posix -> Int -> String
showDate mbZone mbNow offset =
    case ( mbZone, mbNow ) of
        ( Just zone, Just now ) ->
            let
                correctPosix : Time.Posix
                correctPosix =
                    Time.millisToPosix <| Time.posixToMillis now + offset * 86400000

                day : String
                day =
                    correctPosix
                        |> Time.toDay zone
                        |> String.fromInt
                        |> String.padLeft 2 '0'

                month : String
                month =
                    correctPosix
                        |> Time.toMonth zone
                        |> monthString

                year : String
                year =
                    correctPosix
                        |> Time.toYear zone
                        |> String.fromInt
            in
            String.join "/" [ day, month, year ]

        _ ->
            "Carregando"


type Msg
    = OACNumber Int
    | ChangeNomeCompleto String
    | ChangeTelefone String
    | CurrentZone Time.Zone
    | CurrentTime Time.Posix
    | SelectProfilePic
    | ProfilePictureSelected File.File
    | ProfilePictureLoaded String
    | ShowTextOnly
    | PrintDocument


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OACNumber novoNumero ->
            ( { model | numeroOac = novoNumero }, Cmd.none )

        ChangeNomeCompleto novoNome ->
            ( { model | nomeCompleto = String.filter (\c -> Char.isAlpha c || c == ' ') novoNome }, Cmd.none )

        ChangeTelefone novoTelefone ->
            ( { model | telefone = sanitizePhone novoTelefone }, Cmd.none )

        CurrentZone zone ->
            ( { model | fuso = Just zone }, Task.perform CurrentTime Time.now )

        CurrentTime time ->
            ( { model | tempo = Just time }, Cmd.none )

        SelectProfilePic ->
            ( model, Select.file [ "image/png", "image/jpg" ] ProfilePictureSelected )

        ProfilePictureSelected profile ->
            ( model, Task.perform ProfilePictureLoaded (File.toUrl profile) )

        ProfilePictureLoaded url ->
            ( { model | perfil = Just url }, Cmd.none )

        ShowTextOnly ->
            ( { model | exibeTexto = True }, Process.sleep 1000 |> Task.perform (always PrintDocument) )

        PrintDocument ->
            ( { model | exibeTexto = False }, printElement "carteira" )


sanitize : Int -> String -> String
sanitize size str =
    str
        |> String.filter Char.isDigit
        |> String.left size


sanitizePhone : String -> String
sanitizePhone =
    sanitize 6


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


main : Program () Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
